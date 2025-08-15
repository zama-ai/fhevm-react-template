import { FHECounterDemo } from "@/components/FHECounterDemo";

export default function Home() {
  return (
    <main className="">
      <div className="flex flex-col gap-8 items-center sm:items-start w-full px-3 md:px-0">
        <FHECounterDemo />
      </div>
    </main>
  );
}
