export const dynamic = "force-dynamic";

export default function ResetPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Link reset akan dikirim ke email akun Google Anda.
          </p>
        </div>
        <form action="/api/auth/reset" method="POST" className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="anda@gmail.com"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
          <button
            type="submit"
            className="h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            Kirim Link Reset
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Ingat password?{" "}
          <a href="/login" className="font-medium text-primary hover:underline">Kembali ke login</a>
        </p>
      </div>
    </div>
  );
}
