// app/(main)/cars/[id]/page.jsx
const Carpage = async ({ params }) => {
  const { id } = await params;

  return (
    <div>
      <h1>Car Page</h1>
      <p>Car ID: {id}</p>
      <div>
        {/* This will display "hello" when you visit /cars/hello */}
        <h2>You are viewing: {id}</h2>
      </div>
    </div>
  );
};

export default Carpage;
