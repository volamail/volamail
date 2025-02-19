import { projectTemplatesQueryOptions } from '@/modules/templates/queries'
import { Button } from '@/modules/ui/components/button'
import { DashboardPageHeader } from '@/modules/ui/components/dashboard-page-header'
import { EmptyState } from '@/modules/ui/components/empty-state'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { LanguagesIcon, PencilIcon } from 'lucide-react'

export const Route = createFileRoute(
  '/_authed/t/$teamId/p/$projectId/templates/',
)({
  component: Home,
  async loader({ params, context }) {
    await context.queryClient.ensureQueryData(
      projectTemplatesQueryOptions(params.teamId, params.projectId),
    )
  },
  errorComponent: function ErrorComponent() {
    return <div>Error</div>
  },
})

function Home() {
  const params = Route.useParams()

  const { data: templates } = useSuspenseQuery(
    projectTemplatesQueryOptions(params.teamId, params.projectId),
  )

  return (
    <div className="grow px-8 py-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <DashboardPageHeader
          title="Templates"
          description="List of templates defined in this project."
          trailing={
            templates.length > 0 && (
              <Button asChild>
                <Link
                  to="/t/$teamId/p/$projectId/templates/new"
                  params={params}
                >
                  Create a template
                </Link>
              </Button>
            )
          }
        />

        {templates.length > 0 ? (
          <ul className="flex grid-cols-2 flex-col content-stretch gap-4 md:grid">
            {templates.map((template) => (
              <li key={template.slug}>
                <Link
                  className="flex h-full flex-col justify-start gap-6 rounded-lg border p-6 transition-colors dark:border-gray-700 dark:bg-gray-800 hover:dark:bg-gray-700"
                  to="/t/$teamId/p/$projectId/templates/$slug"
                  params={{ ...params, slug: template.slug }}
                >
                  <div className="flex grow flex-col gap-2">
                    <span className="font-medium dark:text-gray-50">
                      {template.slug}
                    </span>

                    <span className="line-clamp-3 text-xs italic dark:text-gray-400">
                      {template.defaultTranslation.contents}
                    </span>
                  </div>

                  <div className="flex flex-col items-start gap-1 text-xs dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <LanguagesIcon className="size-3.5" />
                      {template.translationCount} translations
                    </div>
                    <div className="inline-flex items-center gap-1 text-gray-500 text-xs">
                      <PencilIcon className="size-3.5" />
                      {new Date(template.createdAt).toLocaleString('en-US', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="Create your first template"
            description="No templates were found in this project."
          >
            <Button asChild>
              <Link to="/t/$teamId/p/$projectId/templates/new" params={params}>
                Create a template
              </Link>
            </Button>
          </EmptyState>
        )}
      </div>
    </div>
  )
}
