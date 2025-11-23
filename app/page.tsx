import Image from "next/image";

export default function Home() {
  const links = [
    {
      name: "Instagram",
      url: "https://BDE-FENSUP.short.gy/Instagram",
      icon: "📸",
    },
    { name: "TikTok", url: "https://BDE-FENSUP.short.gy/TikTok", icon: "🎵" },
    {
      name: "Billetterie",
      url: "https://BDE-FENSUP.short.gy/Billetterie",
      icon: "🎟️",
    },
    { name: "Discord", url: "https://BDE-FENSUP.short.gy/Discord", icon: "💬" },
    {
      name: "Site Web",
      url: "https://BDE-FENSUP.short.gy/SiteWeb",
      icon: "🌐",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center relative overflow-hidden">
      {/* Background Gradient Blob */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none " />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] pointer-events-none " />

      <main className="flex-1 flex flex-col items-center w-full max-w-md px-6 py-12 z-10 ">
        {/* Logo Section */}
        <div className="relative mb-7 group mt-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 "></div>
          <div className="relative bg-transparent p-2 m-4">
            <Image
              src="/logo.png"
              alt="Logo BDE FEN'SUP"
              width={200}
              height={200}
              className="object-contain drop-shadow-xl "
            />
          </div>
        </div>

        {/* Header Text */}
        <div className="text-center mb-10 space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            FEN'SUP
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            Bureau des Étudiants
          </p>
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 animate-pulse">
              🚧 Site en construction
            </span>
          </div>
        </div>

        {/* Links Section */}
        <div className="w-full space-y-4">
          {links.map((link) => (
            <a
              key={link.name}
              href={link.url}
              className="group relative flex items-center justify-center w-full p-4 bg-card hover:bg-secondary text-foreground hover:text-white border border-border/50 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <span className="absolute left-6 text-2xl">{link.icon}</span>
              <span className="font-semibold text-lg">{link.name}</span>
            </a>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-sm text-muted-foreground z-10">
        <p>© {new Date().getFullYear()} BDE FEN'SUP. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
