import { GetServerSideProps } from "next";
import { signIn, getProviders } from "next-auth/react";
import GoogleButton from "react-google-button";
import { Card } from "@mui/material";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/routet";

export default function SignIn({ providers }: any) {
  return (
    <div>
      <Card>
        <h1>Login</h1>
        {Object.values<any>(providers).map((provider) => (
          <div key={provider.name}>
            {provider.name === "Google" ? (
              <GoogleButton
                style={{ width: "30vmin" }}
                onClick={() => signIn(provider.id)}
              >
                Sign in with {provider.name}
              </GoogleButton>
            ) : (
              <button onClick={() => signIn(provider.id)}>
                Sign in with {provider.name}
              </button>
            )}
          </div>
        ))}
      </Card>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await unstable_getServerSession(
    context.req,
    context.res,
    authOptions,
  );
  if (session?.user) {
    return {
      redirect: {
        destination: "/",
      },
      props: {},
    };
  }

  const providers = await getProviders();
  return {
    props: { providers },
  };
};
