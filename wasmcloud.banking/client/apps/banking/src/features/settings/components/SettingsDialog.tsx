import * as React from 'react';
import {z} from 'zod';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '@repo/ui/Button';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@repo/ui/Dialog';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@repo/ui/Form';
import {InputPassword} from '@repo/ui/InputPassword';
import {useSettings} from '@/features/settings/hooks/useSettings';
import {Loader2Icon} from 'lucide-react';

const settingsSchema = z.object({
  password: z.string().min(1).max(64),
});

function SettingsDialog(): React.ReactElement {
  const {dialog, auth} = useSettings();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      password: '',
    },
  });

  function onSubmit({password}: z.infer<typeof settingsSchema>) {
    auth.login({password});
  }

  React.useEffect(() => {
    if (auth.status === 'error') {
      form.setError('password', {message: auth.error});
    }
  }, [auth.status, auth.error, form]);

  return (
    <>
      <Dialog open={dialog.open} onOpenChange={dialog.onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Access settings for your account and see statistics, reports, and other information.
            </DialogDescription>
          </DialogHeader>
          {auth.status === 'loggedIn' ? (
            <div className="flex flex-col items-start gap-2 bg-success/10 border border-success rounded-md p-4">
              <div>Login successful.</div>
              <div className="text-sm mb-3">You are now authorized for admin access.</div>
              <Button onClick={auth.logout}>Logout</Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="password"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <InputPassword placeholder="Enter your password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {auth.status === 'loading' ? (
                  <Button disabled>
                    <Loader2Icon className="h-4 animate-spin" /> Loading...
                  </Button>
                ) : (
                  <Button type="submit">Submit</Button>
                )}
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export {SettingsDialog};
