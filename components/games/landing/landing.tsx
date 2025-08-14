import { Chat } from "@/components/chat"
import { generateId } from '@/lib/db/schema'
import { cn } from "@/lib/utils"

export function Landing() {
    const id = generateId()

    return (
        <>
            {/* Full screen background with gradient overlay */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/80 to-black/100"></div>

                <img
                    src="/images/games/dune/dune-wallpaper.jpg"
                    alt="Dune Background"
                    className="object-cover w-full"
                />
            </div>

            <div
                className={cn(
                    'relative flex min-w-0 flex-1 flex-col',
                    'items-center'
                )}
                data-testid="full-chat"
            >
                {/* Content overlay */}
                <div className="relative z-10 flex flex-col gap-6 max-w-3xl w-full px-4">
                    <div className="flex justify-center text-center mt-12 mb-6">
                        <a href="/">
                            <img
                                src="/images/zeus.svg"
                                alt="Zeus - The Enthusiast Gaming Guide"
                                className="max-w-96 left-2 relative"
                            />
                        </a>
                    </div>

                    <Chat id={id} />
                    {/* <div className="">
                        <div className="flex flex-col gap-6 justify-center text-center">
                            <p className="text-center text-4xl font-odibee">
                                What games are you playing today?
                            </p>

                            <p className="text-center text-sm text-gray-300">
                                Talk to Zeus, the gaming god or check out one of the featured games below.
                            </p>
                        </div>
                    </div> */}


                    <div id="landing">
                        {/* Large banner image */}
                        <div className="w-full">
                            <a href="/dune">
                                <img
                                    src="/images/games/dune/dune_awakening.jpg"
                                    alt="Dune Awakening"
                                    className="w-full h-auto object-cover rounded-lg"
                                />
                                <div className="text-center text-xs text-gray-300 mt-2">
                                    Dune Awakening
                                </div>
                            </a>
                        </div>

                        {/* Three bottom game covers */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20 w-full opacity-50">
                            <div className="flex flex-col gap-2">
                                <div className="h-96 overflow-hidden rounded-lg">
                                    <img
                                        src="/images/games/wow/wow-war-within.jpeg"
                                        alt="World of Warcraft: The War Within"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center text-xs text-gray-300">
                                    World of Warcraft: The War Within
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="h-96 overflow-hidden rounded-lg">
                                    <img
                                        src="/images/games/lol/lol.jpg"
                                        alt="League of Legends"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center text-xs text-gray-300">
                                    League of Legends
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="h-96 overflow-hidden rounded-lg">
                                    <img
                                        src="/images/games/diablo/diablo.png"
                                        alt="Diablo 4"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="text-center text-xs text-gray-300">
                                    Diablo 4
                                </div>
                            </div>
                            {/* <div className="flex flex-col gap-2">
                            <div className="h-96 overflow-hidden rounded-lg">
                                <img
                                    src="/images/games/diablo/diablo.png"
                                    alt="Diablo 4"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="text-center text-xs text-gray-300">
                                Diablo 4
                            </div>
                        </div> */}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
