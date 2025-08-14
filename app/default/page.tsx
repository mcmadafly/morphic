import { generateId } from '@/lib/db/schema'

import { Chat } from '@/components/chat'

export default async function Page() {
    const id = generateId()

    return (
        <>
            <Chat id={id} />
        </>
    )
}
