import {
  Dices,
  Spade,
  Heart,
  Club,
  Diamond,
  Crown,
  type LucideIcon,
} from "lucide-react";

export interface Game {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  color: string;
}

const gameColor = "bg-sky-500/10 text-sky-600 dark:text-sky-400";

export const games: Game[] = [
  {
    id: "2048",
    name: "2048",
    description: "Slide tiles and combine them to reach 2048",
    href: "/games",
    icon: Dices,
    color: gameColor,
  },
  {
    id: "tetris",
    name: "Tetris",
    description: "Classic falling-block puzzle",
    href: "/games",
    icon: Spade,
    color: gameColor,
  },
  {
    id: "snake",
    name: "Snake",
    description: "Eat, grow longer, don't crash into yourself",
    href: "/games",
    icon: Heart,
    color: gameColor,
  },
  {
    id: "memory",
    name: "Memory Match",
    description: "Flip cards and match the pairs",
    href: "/games",
    icon: Club,
    color: gameColor,
  },
  {
    id: "sudoku",
    name: "Sudoku",
    description: "Fill the 9x9 grid with numbers 1 to 9",
    href: "/games",
    icon: Diamond,
    color: gameColor,
  },
  {
    id: "tic-tac-toe",
    name: "Tic Tac Toe",
    description: "Three in a row — classic two-player duel",
    href: "/games",
    icon: Crown,
    color: gameColor,
  },
];
