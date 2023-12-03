import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import '@radix-ui/themes/styles.css';
import { Text, Theme } from '@radix-ui/themes';

export const metadata: Metadata = {
    title: 'Amazon Seller Central Replica',
    description: 'Generated by create next app',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>

                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Text size="6" weight="bold">Amazon Seller Central Replica</Text>
                </header>

                <nav>
                    <a href="#">Home</a>
                    <a href="#">Orders</a>
                    <a href="#">Inventory</a>
                    <a href="#">Reports</a>
                    <a href="#">Settings</a>
                </nav>
                <section>
                    <Theme accentColor="orange" grayColor="sand" radius="large" scaling="95%" className="p-4 m-4">
                        {children}
                    </Theme>
                </section>
                <footer>
                    <p>&copy; 2023 Amazon Seller Central Replica. All rights reserved.</p>
                </footer>
            </body>
        </html >
    )
}
