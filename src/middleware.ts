import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { createServerClient } = await import('@supabase/ssr')
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Rotas públicas
  if (pathname === '/login') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      return NextResponse.redirect(
        new URL(profile?.role === 'gestor' ? '/gestor' : '/', request.url)
      )
    }
    return NextResponse.next()
  }

  // Rotas protegidas
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Funcionário não acessa rotas do gestor
  if (pathname.startsWith('/gestor') && profile?.role !== 'gestor') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Gestor acessando raiz redireciona para /gestor
  if (pathname === '/' && profile?.role === 'gestor') {
    return NextResponse.redirect(new URL('/gestor', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*|login).*)'],
}
