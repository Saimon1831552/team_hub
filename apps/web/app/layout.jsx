import { Geist } from 'next/font/google'
import "./globals.css";
import { Toaster } from 'react-hot-toast'

const geist = Geist({ subsets: ['latin'] })

export const metadata = {
  title: 'Team Hub',
  description: 'Collaborative Team Management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 text-gray-900`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}