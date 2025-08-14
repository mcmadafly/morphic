import { getModels } from '@/lib/config/models'
import { generateId } from '@/lib/db/schema'

import { Background } from '@/components/ui/background'

import { DuneChat } from '@/components/games/dune/dune'

export default async function Page() {
    const id = generateId()
    const models = await getModels()
    // console.log('models', models)
    const image = '/images/games/dune/dune-bkg-alt.jpg'

    return (
        <>
            <Background backgroundImage={image} />
            <DuneChat id={id} />
        </>
    )
}
