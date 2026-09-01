import React from 'react'
import './styles.scss'

export const metadata = {
  description: 'Search breweries near you and reserve a spot before you go.',
  title: 'Find a seat tonight',
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
