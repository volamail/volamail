import verificationOtpTemplate from "@/modules/internal-templates/verification-otp.html?raw";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { APIError } from "better-auth/api";
import { emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { Resource } from "sst";
import { clientEnv } from "../client-env";
import { db } from "../database";
import {
  accountsTable,
  allowlistTable,
  sessionsTable,
  teamMembersTable,
  usersTable,
  verificationsTable,
} from "../database/schema";
import { createTeam, generateValidTeamIdFromName } from "../organization/teams";
import { sendEmail } from "../sending/methods";

export const auth = betterAuth({
  baseURL: `${import.meta.env.PROD ? "https" : "http"}://${clientEnv.VITE_DOMAIN}`,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      account: accountsTable,
      session: sessionsTable,
      user: usersTable,
      verification: verificationsTable,
    },
  }),
  databaseHooks: {
    verification: {
      create: {
        async before(verification) {
          if (verification.identifier.startsWith("sign-in-otp-")) {
            const email = verification.identifier.split("sign-in-otp-")[1];

            const allowed = await db.query.allowlistTable.findFirst({
              where: eq(allowlistTable.email, email),
            });

            if (!allowed) {
              throw new APIError("UNAUTHORIZED", {
                message: "Email's not in allow list",
              });
            }
          }
        },
      },
    },
    user: {
      create: {
        async before(user) {
          const allowed = await db.query.allowlistTable.findFirst({
            where: eq(allowlistTable.email, user.email),
          });

          if (!allowed) {
            const headers = new Headers();

            headers.set("Redirect", "/login");

            throw new APIError("UNAUTHORIZED", {
              message: "Email's not in allow list",
            });
          }

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
        async after(user) {
          const userTeams = await db.query.teamMembersTable.findMany({
            where: eq(teamMembersTable.userId, user.id),
          });

          if (userTeams.length > 0) {
            return;
          }

          const name = `${user.name}'s team`;

          const id = await generateValidTeamIdFromName(name);

          await createTeam({ id, name });

          await db.insert(teamMembersTable).values({
            teamId: id,
            userId: user.id,
          });
        },
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") {
          return;
        }

        await sendEmail({
          from: {
            address: clientEnv.VITE_NOREPLY_EMAIL,
            label: "Volamail",
          },
          to: email,
          subject: "Your one-time code",
          text: `Your one-time code is: ${otp}`,
          html: verificationOtpTemplate,
          data: {
            otp,
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
});
