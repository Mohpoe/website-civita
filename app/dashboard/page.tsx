
import { PageTitle } from "@/components/context/dashboard-page-title";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { FileTextIcon } from "lucide-react";
import { Metadata } from "next";

const mainTitle = "Produk";

export const metadata: Metadata = {
  title: mainTitle,
}

export default function DashboardPage() {
  const DIGITAL_PRODUCTS = [
    {
      id: "prod_1",
      title: "Template CV ATS - Bundle Corporate",
      description: "3 varian template CV ATS Word (.docx) siap pakai untuk melamar ke BUMN & Tech Company.",
      price: 35000,
      image: "/assets/portofolio/cv-ats-1.webp",
      category: "Template",
    },
    {
      id: "prod_2",
      title: "E-Book: Rahasia Menembus HRD",
      description: "Panduan lengkap membuat CV, merespon interview, dan negosiasi gaji (PDF 50 halaman).",
      price: 75000,
      image: "/assets/portofolio/cv-ats-1.webp",
      category: "E-Book",
    },
    {
      id: "prod_3",
      title: "Template Notion - Job Tracker",
      description: "Sistem pelacakan lamaran kerja yang terorganisir untuk memaksimalkan peluang lolos.",
      price: 25000,
      image: "/assets/portofolio/cv-ats-1.webp",
      category: "Template",
    },
  ];

  return (
    <>
      <PageTitle title={mainTitle} />

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Produk Digital CIVITA</h2>
          <p className="text-muted-foreground">Tingkatkan peluang lolos kerja kamu dengan template dan panduan eksklusif.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIGITAL_PRODUCTS.map((product) => (
            <Card key={product.id} className="overflow-hidden border-foreground/5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col">
              <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur text-foreground border-none shadow-sm">
                  {product.category}
                </Badge>
              </div>
              <CardHeader className="p-5 pb-0 flex-1">
                <CardTitle className="text-lg leading-tight group-hover:text-foreground/70 transition-colors">{product.title}</CardTitle>
                <CardDescription className="text-sm mt-2 line-clamp-2">{product.description}</CardDescription>
              </CardHeader>
              <CardFooter className="p-5 pt-4 flex items-center justify-between mt-auto">
                <span className="font-bold text-lg">{formatRupiah(product.price)}</span>
                <Button size="sm" className="rounded-full shadow-sm hover:scale-105 transition-transform">
                  Beli Sekarang
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
