import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ROUTES } from "@/lib/constants"
import { HouseIcon } from "lucide-react"
import Link from "next/link"

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Buat akun baru</CardTitle>
        <CardDescription>
          Masukkan informasi berikut untuk mendaftar
        </CardDescription>
        <CardAction>
          <Link href={ROUTES.ROOT} className={buttonVariants({ variant: "link", size: "icon-lg" })}>
            <HouseIcon />
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <form>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input id="name" type="text" placeholder="John Doe" required />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
              <FieldDescription className="text-xs">
                Email hanya digunakan untuk kontak dan tidak dibagikan tanpa izin.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input id="password" type="password" required />
              <FieldDescription className="text-xs">
                Minimal 8 karakter.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">
                Confirm Password
              </FieldLabel>
              <Input id="confirm-password" type="password" required />
              <FieldDescription className="text-xs">
                Konfirmasi password kamu.
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit">Buat Akun</Button>
                <FieldDescription className="px-6 text-center">
                  Sudah punya akun? <Link href={ROUTES.AUTH.LOGIN}>Masuk</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
