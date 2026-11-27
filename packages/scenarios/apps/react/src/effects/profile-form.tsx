import { useEffect, useState } from 'react';

interface ProfileName {
  firstName: string;
  lastName: string;
}

export function EffectProfileName({ firstName, lastName }: ProfileName) {
  const [fullName, setFullName] = useState('');
  // effect: Keep the displayed name in sync with the profile fields.
  useEffect(() => {
    // expect: error react(set-state-in-effect) -- The full name lags behind the profile by one render.
    setFullName(`${firstName} ${lastName}`);
  }, [firstName, lastName]);
  return <output>{fullName}</output>;
}

export function ProfileNamePreview({ firstName, lastName }: ProfileName) {
  const fullName = `${firstName} ${lastName}`;
  return <output>{fullName}</output>;
}

export function ProfileForm({
  firstName,
  lastName,
  saveName,
}: ProfileName & { saveName: (name: string) => void }) {
  const fullName = `${firstName} ${lastName}`;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        saveName(fullName);
      }}
    >
      <output>{fullName}</output>
      <button type="submit">Save name</button>
    </form>
  );
}
