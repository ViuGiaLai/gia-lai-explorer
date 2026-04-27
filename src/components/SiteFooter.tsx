import { Link } from "@tanstack/react-router";
import { Mountain } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/40">
      <div className="container mx-auto grid gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-primary">
            <Mountain className="h-5 w-5" />
            Du Lịch Gia Lai
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Khám phá vẻ đẹp cao nguyên Pleiku — biển hồ, núi lửa, thác, chùa và ẩm thực Gia Lai.
          </p>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground">Khám phá</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/dia-diem" className="text-muted-foreground hover:text-primary">Địa điểm</Link></li>
            <li><Link to="/lich-trinh" className="text-muted-foreground hover:text-primary">Lịch trình</Link></li>
            <li><Link to="/am-thuc" className="text-muted-foreground hover:text-primary">Ẩm thực</Link></li>
            <li><Link to="/da-luu" className="text-muted-foreground hover:text-primary">Địa điểm đã lưu</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-foreground">Liên hệ</h3>
          <p className="text-sm text-muted-foreground">
            Có gợi ý hay phản hồi? Hãy liên hệ với chúng tôi để cùng giới thiệu Gia Lai đến nhiều người hơn.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Du Lịch Gia Lai. Mọi quyền được bảo lưu.
      </div>
    </footer>
  );
}
