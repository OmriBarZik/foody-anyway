import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useSession, signIn, getProviders } from "next-auth/react";

export default function SignIn({ providers }: any) {
  const router = useRouter();
  const { data: session } = useSession();
  session && session.user && router.replace("/");

  return (
    <div css>
      {Object.values<any>(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
