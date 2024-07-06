import {
  CreditCardIcon,
  ExternalLink,
  Trash2Icon,
  Wallet2Icon,
  WalletIcon,
  WalletMinimalIcon,
} from "lucide-solid";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTrigger,
} from "~/lib/ui/components/alert-dialog";
import { Button } from "~/lib/ui/components/button";
import { showToast } from "~/lib/ui/components/toasts";
import { useMutation } from "~/lib/ui/hooks/useMutation";
import { redirectToProSubscriptionCheckout } from "../actions";
import { SUBSCRIPTION_QUOTAS, SUBSCRIPTION_TYPE_PRO } from "../constants";

type Props = {
  team: {
    id: string;
    name: string;
  };
  projectId: string;
  class?: string;
};

export function UpgradeSubscriptionDialog(props: Props) {
  const redirectToProSubscriptionCheckoutMutation = useMutation({
    action: redirectToProSubscriptionCheckout,
    onError(e) {
      console.log(e);
      showToast({
        title: "Unable to create checkout session",
        variant: "error",
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger
        as={Button}
        icon={() => <CreditCardIcon class="size-4" />}
        class={props.class}
      >
        Upgrade plan
      </AlertDialogTrigger>
      <AlertDialogContent class="flex flex-col gap-6">
        <div class="flex flex-col gap-2">
          <AlertDialogTitle>Upgrade to Pro</AlertDialogTitle>
          <AlertDialogDescription as="div" class="flex flex-col gap-4">
            <p>
              You're upgrading the <strong>{props.team.name}</strong> team to
              the <strong>Pro</strong> plan.
            </p>

            <div>
              This plan will give your team access to:
              <ul class="list-disc pl-6 text-sm">
                <li>
                  {SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_PRO].projects} projects
                </li>
                <li>
                  {SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_PRO].emails} emails
                  sent per month
                </li>
                <li>
                  {SUBSCRIPTION_QUOTAS[SUBSCRIPTION_TYPE_PRO].storage / 1000}MB
                  of storage per project
                </li>
              </ul>
            </div>
            <p>
              If you're in need of a custom plan, please write to us at{" "}
              <a href="mailto:info@volamail.com" class="font-bold">
                info@volamail.com
              </a>
              .
            </p>
          </AlertDialogDescription>
        </div>

        <form
          method="post"
          action={redirectToProSubscriptionCheckout}
          class="flex gap-2 justify-end"
        >
          <input type="hidden" name="teamId" value={props.team.id} />
          <input type="hidden" name="projectId" value={props.projectId} />

          <Button
            type="submit"
            class="self-end"
            icon={() => <ExternalLink class="size-4" />}
            loading={redirectToProSubscriptionCheckoutMutation.pending}
          >
            Go to checkout
          </Button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
