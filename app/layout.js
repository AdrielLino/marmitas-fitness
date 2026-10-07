import "./globals.css";

export const metadata = {
  title: "Marmitas Fit Congeladas",
  description: "Cardápio da semana. Peça pelo WhatsApp.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
