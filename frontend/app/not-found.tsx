import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32 gap-4">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <p className="text-muted-foreground">ページが見つかりませんでした</p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        トップに戻る
      </Link>
    </div>
  );
}
