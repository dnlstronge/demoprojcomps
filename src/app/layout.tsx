
import './globals.css'
import { Inter } from 'next/font/google'
import classes from "./layout.module.css"
import NavBar from '@/pages/NavBar'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Component Editor',
  description: '',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
