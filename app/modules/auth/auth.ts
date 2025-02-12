import verificationOtpTemplate from "@/modules/internal-templates/verification-otp.html?raw";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware, emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resource } from "sst";
import { clientEnv } from "../client-env";
import { db } from "../database";
import {
  accountsTable,
  sessionsTable,
  teamMembersTable,
  usersTable,
  verificationsTable,
} from "../database/schema";
import { createTeam, generateValidTeamIdFromName } from "../organization/teams";
import { sendEmail } from "../sending/methods";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      verification: verificationsTable,
      account: accountsTable,
      session: sessionsTable,
      user: usersTable,
    },
  }),
  hooks: {
    after: createAuthMiddleware(async ({ context, path }) => {
      if (path.startsWith("/callback") && context.newSession) {
        const user = context.newSession.user;

        const userTeams = await db.query.teamMembersTable.findMany({
          where: eq(teamMembersTable.userId, user.id),
        });

        if (userTeams.length > 0) {
          return;
        }

        const id = await generateValidTeamIdFromName(`${user.name}'s team`);

        await createTeam({ id, name: `${user.name}'s team` });

        await db.insert(teamMembersTable).values({
          teamId: id,
          userId: user.id,
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        async before(user) {
          if (user.email !== user.name) {
            return { data: user };
          }

          return {
            data: {
              ...user,
              name: user.email.split("@")[0],
            },
          };
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP(data) {
        await sendEmail({
          from: {
            address: clientEnv.VITE_NOREPLY_EMAIL,
            label: "Volamail",
          },
          to: data.email,
          subject: "Your one-time code",
          text: `Your one-time code is: ${data.otp}`,
          html: verificationOtpTemplate,
          data: {
            otp: data.otp,
          },
        });
      },
    }),
  ],
  socialProviders: {
    github: {
      clientId: clientEnv.VITE_GITHUB_CLIENT_ID,
      clientSecret: Resource.GithubClientSecret.value,
    },
  },
  user: {
    additionalFields: {
      avatarUrl: {
        type: "string",
      },
    },
  },
});
