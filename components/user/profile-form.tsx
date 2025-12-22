'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfileAction } from '@/app/actions/user';
import { updateProfileSchema } from '@/lib/schemas/profile';

type ProfileFormProps = {
  currentName: string;
};

export default function ProfileForm({ currentName }: ProfileFormProps) {
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    // Client-side validation
    const result = updateProfileSchema.safeParse({ name });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    startTransition(async () => {
      const response = await updateProfileAction({ name });
      if ('error' in response) {
        setError(response.error);
      } else {
        setSuccess(true);
        // Update the session with new name
        await update({ user: { name: response.name } });
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  const handleInputChange = () => {
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm p-3 rounded-md flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Profile updated successfully!
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={currentName}
          onChange={handleInputChange}
          className={error ? 'border-destructive' : ''}
          disabled={isPending}
        />
        <p className="text-sm text-muted-foreground">
          Your name as it will appear on orders
        </p>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          'Update Profile'
        )}
      </Button>
    </form>
  );
}
