import WallDesigner from "@/components/wall-designer/WallDesigner";

export const metadata = {
  title: "Wall Designer",
};

export default function WallDesignerPage() {
  return (
    <main>
      <h1 className="pt-8 text-center text-3xl font-bold">
        Modular Wall Designer
      </h1>
      <WallDesigner />
    </main>
  );
}