import { Table } from "@tiptap/extension-table/table"
import type {
  TableCellOptions,
  TableHeaderOptions,
  TableOptions,
  TableRowOptions,
} from "@tiptap/extension-table"
import { TableCell, TableHeader, TableRow } from "@tiptap/extension-table"
import { Extension } from "@tiptap/core"
import {
  cellAround,
  columnResizing,
  tableEditing,
  TableView,
} from "@tiptap/pm/tables"
import { TextSelection } from "@tiptap/pm/state"
import type { Node } from "@tiptap/pm/model"
import type { ViewMutationRecord } from "@tiptap/pm/view"
import type { Editor } from "@tiptap/core"

import {
  EMPTY_CELL_WIDTH,
  RESIZE_MIN_WIDTH,
} from "@/components/tiptap-node/table-node/lib/tiptap-table-utils"

export const TableNode = Table.extend<TableOptions>({
  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable

    const defaultCellMinWidth =
      this.options.cellMinWidth < EMPTY_CELL_WIDTH
        ? EMPTY_CELL_WIDTH
        : this.options.cellMinWidth

    return [
      ...(isResizable
        ? [
            columnResizing({
              handleWidth: this.options.handleWidth,
              cellMinWidth: RESIZE_MIN_WIDTH,
              defaultCellMinWidth,
              View: null,
              lastColumnResizable: this.options.lastColumnResizable,
            }),
          ]
        : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
    ]
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const width = element.getAttribute("width") || element.style.width
          return width ? parseInt(width, 10) : null
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {}
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          }
        },
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align"),
        renderHTML: (attributes) => {
          if (!attributes.align) return {}
          return {
            "data-align": attributes.align,
          }
        },
      },
    }
  },

  addNodeView() {
    return ({ node, HTMLAttributes, getPos, editor }) => {
      class TiptapTableView extends TableView {
        private readonly blockContainer: HTMLDivElement
        private readonly innerTableContainer: HTMLDivElement
        private readonly widgetsContainer: HTMLDivElement
        private readonly overlayContainer: HTMLDivElement
        private resizeHandleLeft: HTMLDivElement | null = null
        private resizeHandleRight: HTMLDivElement | null = null
        private isResizing = false
        private resizeStartX = 0
        private resizeStartWidth = 0
        private resizeHandleUsed: "left" | "right" | null = null

        declare readonly node: Node
        declare readonly minCellWidth: number
        private readonly containerAttributes: Record<string, string>
        private readonly editor: Editor
        private readonly getPos: () => number | undefined

        constructor(
          node: Node,
          minCellWidth: number,
          containerAttributes: Record<string, string>,
          editor: Editor,
          getPos: () => number | undefined
        ) {
          super(node, minCellWidth)

          this.containerAttributes = containerAttributes ?? {}
          this.editor = editor
          this.getPos = getPos

          this.blockContainer = this.createBlockContainer()
          this.innerTableContainer = this.createInnerTableContainer()
          this.widgetsContainer = this.createWidgetsContainer()
          this.overlayContainer = this.createOverlayContainer()

          this.setupDOMStructure()
          this.updateStyles()
          
          if (this.editor.isEditable) {
             this.createResizeHandles()
          }
        }

        private createBlockContainer(): HTMLDivElement {
          const container = document.createElement("div")
          container.setAttribute("data-content-type", "table")
          container.style.transition = "all 0.2s ease"
          container.style.position = "relative" // Needed for absolute handles
          this.applyContainerAttributes(container)
          return container
        }

        private createInnerTableContainer(): HTMLDivElement {
          const container = document.createElement("div")
          container.className = "table-container"
          return container
        }

        private createWidgetsContainer(): HTMLDivElement {
          const container = document.createElement("div")
          container.className = "table-controls"
          container.style.position = "relative"
          return container
        }

        private createOverlayContainer(): HTMLDivElement {
          const container = document.createElement("div")
          container.className = "table-selection-overlay-container"
          return container
        }

        private applyContainerAttributes(element: HTMLDivElement): void {
          Object.entries(this.containerAttributes).forEach(([key, value]) => {
            if (key !== "class") {
              element.setAttribute(key, value)
            }
          })
        }

        private setupDOMStructure(): void {
          const originalTable = this.dom
          const tableElement = originalTable // TableView creates the table as this.dom

          // Move table into inner container
          this.innerTableContainer.appendChild(tableElement)

          // Build the hierarchy: blockContainer > innerContainer > table
          this.blockContainer.appendChild(this.innerTableContainer)
          this.blockContainer.appendChild(this.widgetsContainer)
          this.blockContainer.appendChild(this.overlayContainer)

          // Update this.dom to be the wrapper
          this.dom = this.blockContainer
          // this.contentDOM remains the tbody inside the table, which is handled by super()
        }

        private createResizeHandles() {
            const createHandle = (side: "left" | "right") => {
                const handle = document.createElement("div")
                handle.className = `table-resize-handle-pill table-resize-handle-${side}`
                
                handle.addEventListener("mousedown", (e) => this.onResizeStart(e, side))
                return handle
            }

            this.resizeHandleLeft = createHandle("left")
            this.resizeHandleRight = createHandle("right")

            this.blockContainer.appendChild(this.resizeHandleLeft)
            this.blockContainer.appendChild(this.resizeHandleRight)

            this.blockContainer.addEventListener("mouseenter", () => {
                if (this.resizeHandleLeft) this.resizeHandleLeft.style.opacity = "1"
                if (this.resizeHandleRight) this.resizeHandleRight.style.opacity = "1"
            })

            this.blockContainer.addEventListener("mouseleave", () => {
                if (!this.isResizing) {
                    if (this.resizeHandleLeft) this.resizeHandleLeft.style.opacity = "0"
                    if (this.resizeHandleRight) this.resizeHandleRight.style.opacity = "0"
                }
            })
        }

        private onResizeStart(e: MouseEvent, side: "left" | "right") {
            e.preventDefault()
            e.stopPropagation()
            this.isResizing = true
            this.resizeHandleUsed = side
            this.resizeStartX = e.clientX
            this.resizeStartWidth = this.blockContainer.offsetWidth
            
            // Disable transition for instant feedback
            this.blockContainer.style.transition = "none"

            document.addEventListener("mousemove", this.onResizeMove)
            document.addEventListener("mouseup", this.onResizeEnd)
        }

        private onResizeMove = (e: MouseEvent) => {
            if (!this.isResizing) return

            const delta = e.clientX - this.resizeStartX
            const align = this.node.attrs.align
            const isCentered = align === "center"
            
            // If centered, we multiply by 2 so the handle follows the cursor (since table grows from center)
            const multiplier = isCentered ? 2 : 1
            const directionMultiplier = this.resizeHandleUsed === "left" ? -1 : 1
            
            let newWidth = this.resizeStartWidth + (delta * directionMultiplier * multiplier)
            
            if (newWidth < 150) newWidth = 150
            
            // Limit max width to parent?
            const parentWidth = this.blockContainer.parentElement?.clientWidth || 800
            if (newWidth > parentWidth) newWidth = parentWidth

            this.blockContainer.style.width = `${newWidth}px`
        }

        private onResizeEnd = () => {
            this.isResizing = false
            this.resizeHandleUsed = null
            document.removeEventListener("mousemove", this.onResizeMove)
            document.removeEventListener("mouseup", this.onResizeEnd)
            
            // Restore transition
            this.blockContainer.style.transition = "all 0.2s ease"

            // Update node attribute
            const width = this.blockContainer.offsetWidth
            const pos = this.getPos()
            if (pos !== undefined) {
                this.editor.commands.updateAttributes("table", { width })
            }
        }

        update(node: Node): boolean {
          if (node.type !== this.node.type) return false
          
          // Call super.update to let TableView handle column widths etc.
          const updated = super.update(node)
          
          if (updated) {
              // this.node is updated by super.update(node) internally in TableView?
              // Actually TableView.update(node) sets this.node = node. 
              // Let's check TableView source or type definition.
              // If it's readonly in the type definition but we extend it, we might need to cast or trust super.
              // However, looking at prosemirror-tables source, update(node) sets this.node.
              // The error says it's readonly. 
              // We can just use the passed 'node' for updateStyles.
              this.updateStyles(node)
          }
          
          return updated
        }

        private updateStyles(node: Node = this.node) {
            const { width, align } = node.attrs
            
            // Alignment
            this.blockContainer.style.margin = "0"
            this.blockContainer.style.float = "none"
            this.blockContainer.style.display = "block"

            if (align === "center") {
                this.blockContainer.style.margin = "0 auto"
            } else if (align === "left") {
                this.blockContainer.style.float = "left"
                this.blockContainer.style.marginRight = "1rem"
                this.blockContainer.style.marginBottom = "1rem"
            } else if (align === "right") {
                this.blockContainer.style.float = "right"
                this.blockContainer.style.marginLeft = "1rem"
                this.blockContainer.style.marginBottom = "1rem"
            }

            // Width
            if (width) {
                this.blockContainer.style.width = `${width}px`
            } else {
                // Default behavior
                if (align === "left" || align === "right") {
                    this.blockContainer.style.width = "fit-content"
                } else {
                    this.blockContainer.style.width = "100%"
                }
            }
        }

        ignoreMutation(mutation: ViewMutationRecord): boolean {
          const target = mutation.target as HTMLElement
          const isInsideTable = target.closest(".table-container")

          // Allow mutations inside the table (handled by TableView/ProseMirror)
          // But ignore mutations on our wrapper structure unless it's the table itself
          return !isInsideTable || super.ignoreMutation(mutation)
        }
      }

      const cellMinWidth =
        this.options.cellMinWidth < EMPTY_CELL_WIDTH
          ? EMPTY_CELL_WIDTH
          : this.options.cellMinWidth
      return new TiptapTableView(node, cellMinWidth, HTMLAttributes, editor, getPos)
    }
  },
})

const TableCellNode = TableCell.extend<TableCellOptions>({
  addKeyboardShortcuts() {
    return {
      ...this.parent?.(),
      "Mod-a": () => {
        const { state, view } = this.editor
        const { selection, doc } = state

        const $anchor = selection.$anchor
        const cellPos = cellAround($anchor)
        if (!cellPos) {
          return false
        }

        const cellNode = doc.nodeAt(cellPos.pos)
        if (!cellNode || !cellNode.textContent) {
          return false
        }

        const from = cellPos.pos + 1
        const to = cellPos.pos + cellNode.nodeSize - 1

        if (from >= to) {
          return true
        }

        const $from = doc.resolve(from)
        const $to = doc.resolve(to)

        const nextSel = TextSelection.between($from, $to, 1)
        if (!nextSel) {
          return true
        }

        if (state.selection.eq(nextSel)) {
          return true
        }

        view.dispatch(state.tr.setSelection(nextSel))
        return true
      },
    }
  },
})

export interface TableNodeOptions {
  /**
   * If set to false, the table extension will not be registered
   * @example table: false
   */
  table: Partial<TableOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableCell: false
   */
  tableCell: Partial<TableCellOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableHeader: false
   */
  tableHeader: Partial<TableHeaderOptions> | false
  /**
   * If set to false, the table extension will not be registered
   * @example tableRow: false
   */
  tableRow: Partial<TableRowOptions> | false
}

/**
 * The table kit is a collection of table editor extensions.
 *
 * It’s a good starting point for building your own table in Tiptap.
 */
export const TableKit = Extension.create<TableNodeOptions>({
  name: "tableKit",

  addExtensions() {
    const extensions = []

    if (this.options.table !== false) {
      extensions.push(TableNode.configure(this.options.table))
    }

    if (this.options.tableCell !== false) {
      extensions.push(TableCellNode.configure(this.options.tableCell))
    }

    if (this.options.tableHeader !== false) {
      extensions.push(TableHeader.configure(this.options.tableHeader))
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options.tableRow))
    }

    return extensions
  },
})
