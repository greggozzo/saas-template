// components/ShowCard.tsx
import Image from 'next/image';
import Link from 'next/link';

interface Show {
  id: number;
  name: string;
  poster_path: string;
}

export default function ShowCard({ show }: { show: Show }) {
  return (
    <Link href={`/show/${show.id}`} className="group relative overflow-hidden rounded-3xl shadow-xl">
      <Image
        src={`https://image.tmdb.org/t/p/w500${show.poster_path}`}
        alt={show.name}
        width={300}
        height={450}
        className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent h-24" />
      <div className="absolute bottom-4 left-4 right-4">
        <p className="font-semibold text-lg leading-tight">{show.name}</p>
        <p className="text-emerald-400 text-sm mt-1">See best month →</p>
      </div>
    </Link>
  );
}
