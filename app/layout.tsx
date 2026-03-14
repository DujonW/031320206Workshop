import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata: Metadata = {
  title: "Where Am I in Pi? 🥧 Pi Day Birthday Finder",
  description:
    "Enter your date of birth and discover exactly where it hides in the infinite digits of π. Celebrate Pi Day — March 14!",
  openGraph: {
    title: "Where Am I in Pi?",
    description: "Find your birthday in the digits of π",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
