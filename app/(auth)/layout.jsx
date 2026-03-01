const AuthLayout = ({ children }) => {
  return (
    <main className="flex flex-col justify-center items-center h-screen">
      {children}
    </main>
  );
};

export default AuthLayout;
