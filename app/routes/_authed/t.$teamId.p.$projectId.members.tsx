import { InviteMemberDialog } from '@/modules/organization/components/invite-member-dialog'
import { ResendTeamInviteDialog } from '@/modules/organization/components/resend-team-invite-dialog'
import { RevokeTeamInviteDialog } from '@/modules/organization/components/revoke-team-invite-dialog'
import {
  teamInvitesOptions,
  teamMembersOptions,
} from '@/modules/organization/queries'
import { ActionButton } from '@/modules/ui/components/action-button'
import { Badge } from '@/modules/ui/components/badge'
import { Button } from '@/modules/ui/components/button'
import { DashboardPageHeader } from '@/modules/ui/components/dashboard-page-header'
import { useImperativeDialog } from '@/modules/ui/components/dialog'
import { EmptyState } from '@/modules/ui/components/empty-state'
import { Menu, MenuItem } from '@/modules/ui/components/menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from '@/modules/ui/components/table'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { formatDistanceToNow, formatRelative } from 'date-fns'
import { MoreVerticalIcon, RotateCwIcon, XIcon } from 'lucide-react'

export const Route = createFileRoute('/_authed/t/$teamId/p/$projectId/members')(
  {
    component: RouteComponent,
    async loader({ params, context }) {
      await Promise.all([
        context.queryClient.ensureQueryData(teamMembersOptions(params.teamId)),
        context.queryClient.ensureQueryData(teamInvitesOptions(params.teamId)),
      ])
    },
  },
)

function RouteComponent() {
  const params = Route.useParams()

  const { data: members } = useSuspenseQuery(teamMembersOptions(params.teamId))
  const { data: invites } = useSuspenseQuery(teamInvitesOptions(params.teamId))

  const resendInviteDialog = useImperativeDialog<{
    teamId: string
    email: string
  }>()

  const deleteInviteDialog = useImperativeDialog<{
    teamId: string
    email: string
  }>()

  return (
    <div className="flex flex-col items-center justify-start h-full py-16 px-8">
      <div className="flex flex-col gap-8 w-full max-w-3xl">
        <DashboardPageHeader
          title="Members"
          description="Manage your team's members"
          trailing={
            invites.length > 0 && <InviteMemberDialog teamId={params.teamId} />
          }
        />

        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Pending invites</h2>

          {invites.length > 0 ? (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableHeadCell>Email</TableHeadCell>
                    <TableHeadCell>Status</TableHeadCell>
                    <TableHeadCell>Sent</TableHeadCell>
                    <TableHeadCell>Expires</TableHeadCell>
                    <TableHeadCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.email}>
                      <TableCell>{invite.email}</TableCell>
                      <TableCell>
                        <Badge
                          color={invite.status === 'pending' ? 'yellow' : 'red'}
                        >
                          {invite.status === 'pending' ? 'Pending' : 'Expired'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(invite.createdAt).toLocaleString('en-US', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(invite.expiresAt), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <Menu
                          trigger={
                            <ActionButton
                              variant="ghost"
                              color="neutral"
                              padding="sm"
                            >
                              <MoreVerticalIcon className="size-4" />
                            </ActionButton>
                          }
                          onSelect={({ value }) => {
                            if (value === 'resend') {
                              return resendInviteDialog.open({
                                teamId: params.teamId,
                                email: invite.email,
                              })
                            }

                            if (value === 'delete') {
                              return deleteInviteDialog.open({
                                teamId: params.teamId,
                                email: invite.email,
                              })
                            }
                          }}
                        >
                          <MenuItem value="resend">
                            <RotateCwIcon className="size-4" />
                            Send again
                          </MenuItem>
                          <MenuItem
                            value="delete"
                            className="dark:text-red-500"
                          >
                            <XIcon className="size-4" />
                            Revoke invite
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <ResendTeamInviteDialog {...resendInviteDialog.props} />
              <RevokeTeamInviteDialog {...deleteInviteDialog.props} />
            </>
          ) : (
            <EmptyState
              title="No pending invites"
              description="There are no pending invites for this team"
            >
              <InviteMemberDialog teamId={params.teamId} />
            </EmptyState>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Members</h2>

          {members.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeadCell>Username</TableHeadCell>
                  <TableHeadCell>Email</TableHeadCell>
                  <TableHeadCell>Role</TableHeadCell>
                  <TableHeadCell>Joined</TableHeadCell>
                  <TableHeadCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.userId}>
                    <TableCell>{member.user.name}</TableCell>
                    <TableCell>{member.user.email}</TableCell>
                    <TableCell>Admin</TableCell>
                    <TableCell>
                      {new Date(member.joinedAt).toLocaleDateString('en-US')}
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        variant="ghost"
                        color="neutral"
                        padding="sm"
                      >
                        <MoreVerticalIcon className="size-4" />
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              title="No members"
              description="There are no members in this team"
            >
              <Button>Invite a member</Button>
            </EmptyState>
          )}
        </section>
      </div>
    </div>
  )
}
