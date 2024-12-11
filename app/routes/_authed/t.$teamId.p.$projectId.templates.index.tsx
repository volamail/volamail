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
    <div className="py-16 px-8 grow">
      <div className="flex flex-col max-w-3xl mx-auto gap-8">
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
          <ul className="flex flex-col md:grid grid-cols-2 gap-4 content-stretch">
            {templates.map((template) => (
              <li key={template.slug}>
                <Link
                  className="flex flex-col h-full gap-6 justify-start p-6 dark:bg-gray-800 hover:dark:bg-gray-700 transition-colors border dark:border-gray-700 rounded-lg"
                  to="/t/$teamId/p/$projectId/templates/$slug"
                  params={{ ...params, slug: template.slug }}
                >
                  <div className="grow flex flex-col gap-2">
                    <span className="dark:text-gray-50 font-medium">
                      {template.slug}
                    </span>

                    <span className="text-xs dark:text-gray-400 italic line-clamp-3">
                      {template.defaultTranslation.contents}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 items-start text-xs dark:text-gray-500">
                    <div className="flex items-center gap-1">
                      <LanguagesIcon className="size-3.5" />
                      {template.translationCount} translations
                    </div>
                    <div className="text-xs text-gray-500 inline-flex gap-1 items-center">
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
