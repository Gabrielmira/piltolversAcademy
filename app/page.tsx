export default function HomePage() {
  // Redirect to login page
  if (typeof window !== "undefined") {
    window.location.href = "/login"
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecionando...</p>
    </div>
  )
}
