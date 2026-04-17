import Link from "next/link";
import { ArrowLeft, Gamepad2 } from "lucide-react";
import { games } from "@/lib/games-data";
import { cn } from "@/lib/cn";

export const metadata = {
  title: "Games — Tooldit",
  description:
    "Free browser games on Tooldit. 2048, Tetris, Snake, Sudoku and more — all private, all in your browser.",
};

export default function GamesPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to home
      </Link>

      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <Gamepad2 className="h-7 w-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Games
          </h1>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const GameIcon = game.icon;
          return (
            <div
              key={game.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5"
            >
              <div
                className={cn(
                  "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
                  game.color
                )}
              >
                <GameIcon className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-semibold text-card-foreground">
                {game.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {game.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
