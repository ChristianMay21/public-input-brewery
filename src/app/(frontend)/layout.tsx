import React from 'react'
import './styles.scss'

export const metadata = {
  description: 'A blank Next.js app template.',
  title: 'Blank Template',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
