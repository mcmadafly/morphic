interface BackgroundProps {
    backgroundImage?: string
}

export function Background({ backgroundImage = "/images/games/dune/dune-wallpaper.jpg" }: BackgroundProps) {
    return (
        <div className="absolute inset-0 z-0">
            <img
                src={backgroundImage}
                alt="Dune Background"
                className=" top-0"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black/100"></div>
        </div>
    )
}