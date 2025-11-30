"use server";

import { prisma } from "@/lib/prisma";
import { ConversationParticipant, Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { unstable_noStore as noStore } from "next/cache";

export async function getConversations() {
  noStore();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  return conversations;
}

export async function getConversation(conversationId: string) {
  noStore();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversation = await prisma.conversation.findUnique({
    where: {
      id: conversationId,
    },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      ticket: true,
    },
  });

  if (!conversation) return null;

  // Verify participation or admin role
  const isParticipant = conversation.participants.some(
    (p: ConversationParticipant) => p.userId === session.user.id
  );
  const isAdmin = session.user.role === "admin" || session.user.role === "superadmin";

  if (!isParticipant && !isAdmin) {
    throw new Error("Unauthorized");
  }

  return conversation;
}

// ... (getConversation above)

export async function getPinnedConversations() {
  noStore();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      AND: [
        {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          OR: [
            {
              participants: {
                some: {
                  userId: session.user.id,
                  isPinned: true,
                },
              },
            },
            {
              participants: {
                some: {
                  user: {
                    position: {
                      in: ["President", "Tresorier", "Secretaire"],
                    },
                  },
                },
              },
            },
          ],
        },
      ],
    },
    take: 10,
    include: {
      participants: {
        include: {
          user: true,
        },
      },
      messages: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
    orderBy: {
      lastMessageAt: "desc",
    },
  });

  return conversations;
}

export async function togglePinConversation(conversationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  if (!participant) {
    throw new Error("Not found");
  }

  // If we are pinning (currently false), check the limit
  if (!participant.isPinned) {
    const pinnedCount = await prisma.conversationParticipant.count({
      where: {
        userId: session.user.id,
        isPinned: true,
      },
    });

    if (pinnedCount >= 4) {
      throw new Error("Maximum 4 conversations pinned");
    }
  }

  await prisma.conversationParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      isPinned: !participant.isPinned,
    },
  });

  return !participant.isPinned;
}

export async function getMessages(conversationId: string) {
  noStore();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify participant or admin role
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  const isAdmin = session.user.role === "admin" || session.user.role === "superadmin";

  if (!participant && !isAdmin) {
    throw new Error("Unauthorized");
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    include: {
      sender: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return messages;
}

export async function sendMessage(conversationId: string, content: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Verify participant or admin role
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
  });

  const isAdmin = session.user.role === "admin" || session.user.role === "superadmin";

  if (!participant && !isAdmin) {
    throw new Error("Unauthorized");
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content,
    },
    include: {
      sender: true,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      lastMessageAt: new Date(),
    },
  });

  return message;
}

export async function markAsRead(conversationId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  await prisma.conversationParticipant.update({
    where: {
      conversationId_userId: {
        conversationId,
        userId: session.user.id,
      },
    },
    data: {
      lastReadAt: new Date(),
    },
  });
}

export async function searchUsers(query: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!query || query.length < 2) {
    return [];
  }

  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: session.user.id,
          },
        },
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phoneNumber: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  return users;
}

export async function getMandatoryUsers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const users = await prisma.user.findMany({
    where: {
      position: {
        in: ["President", "Tresorier", "Secretaire"],
      },
      id: {
        not: session.user.id, // Exclude self if I am one of them
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      position: true,
    },
  });

  return users;
}

export async function createConversation(targetUserId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check if conversation already exists
  const existingConversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          participants: {
            some: {
              userId: targetUserId,
            },
          },
        },
      ],
    },
  });

  if (existingConversation) {
    return existingConversation;
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: session.user.id }, { userId: targetUserId }],
      },
    },
  });

  return conversation;
}

export async function getAdminTickets() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const tickets = await prisma.ticket.findMany({
    include: {
      user: {
        select: {
          email: true,
        },
      },
      conversation: {
        include: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  type TicketWithConversation = Prisma.TicketGetPayload<{
    include: {
      user: {
        select: {
          email: true;
        };
      };
      conversation: {
        include: {
          messages: true;
        };
      };
    };
  }>;

  return tickets.map((t: TicketWithConversation) => ({
    id: t.conversationId, // Use conversationId as the main ID for consistency in UI
    ticketId: t.id,
    subject: t.subject,
    guestName: t.guestName,
    guestEmail: t.guestEmail,
    userEmail: t.user?.email,
    ticketStatus: t.status,
    createdAt: t.createdAt,
    lastMessageAt: t.conversation.lastMessageAt,
    messages: t.conversation.messages,
  }));
}
