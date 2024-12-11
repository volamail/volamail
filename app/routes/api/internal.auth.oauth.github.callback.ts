import { handleGithubCallback } from '@/modules/auth/github'
import { getUserDefaultProject } from '@/modules/organization/projects'
import { createAPIFileRoute } from '@tanstack/start/api'

export const APIRoute = createAPIFileRoute(
  '/api/internal/auth/oauth/github/callback',
)({
  GET: async ({ request }) => {
    const user = await handleGithubCallback(request)

    const defaultProject = await getUserDefaultProject(user.id)

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/t/${defaultProject.teamId}/p/${defaultProject.id}/templates`,
      },
    })
  },
})
