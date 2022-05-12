import * as React from "react";
import { useState, useEffect } from "react";
import { Link, Route, Routes, BrowserRouter } from "react-router-dom";
import styled from "styled-components";
import { Virtuoso } from "react-virtuoso";

const App = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState<number>(0);
  const [userDetail, setUserDetail] = useState<UserDetailProps>({
    id: "",
    picture: "",
    email: "",
    dateOfBirth: "",
    gender: "",
    firstName: "",
    lastName: "",
    phone: 0,
  });
  const [id, setId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  interface UserDetailProps {
    id: string;
    picture: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    firstName: string;
    lastName: string;
    phone: number;
  }

  // fetch for ListView, page state is passed to the API
  const fetchUsers = async (page: number) => {
    const response = await fetch(
      `https://dummyapi.io/data/v1/user?page=${page}&limit=10`,
      {
        method: "GET",
        headers: {
          "app-id": "627a6b9eaf56419de59a26b9",
        },
      }
    );
    const data = await response.json();

    // creating a new array concatinating an old array with the new users fetched
    const temp = [...users].concat(data.data);

    setUsers(temp);
  };

  //fetchUsers for ViewList with page number 0 initialized on the first render of a page
  useEffect(() => {
    fetchUsers(0);
  }, []);

  // on a scroll to the end it changes the page state and it calls the fetchUsers again with new page passed in
  const loadMore = async () => {
    setPage(page + 1);
    fetchUsers(page + 1);
  };

  // onClick returning the user.id from the ViewList and then passing it to the id state and to the api and fetch it
  const returnId = (user: { id: string }) => {
    setId(user.id);
  };

  // fetching the UserDetail item
  useEffect(() => {
    const fetchUserDetail = async (id: string) => {
      // useParams did not work for me so I used window.location and its pathname
      const idFromUrl = window.location.pathname;

      // if we have an id from Url then we take it and remove the first character which is a slash "/" to prevent that there will be a double slash in API reuqest
      if (idFromUrl) id = idFromUrl.slice(1);

      // the starting state of id is null, we get the id after clicking on an user with returnId function, so we do not want to fetch the user if id is equal to null
      if (id !== "") {
        // first we setLoading to true to show the ..loading status before data is fetched
        setLoading(true);

        // fetching process
        fetch(`https://dummyapi.io/data/v1/user/${id}`, {
          method: "GET",
          headers: {
            "app-id": "627a6b9eaf56419de59a26b9",
          },
        })
          .then((response) => {
            if (response.ok) {
              return response.json();
            }
            throw response;
          })
          .then((data) => {
            setUserDetail(data);
          })
          .catch((error) => {
            console.error("Error fetching data", error);
            setError(error);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };
    fetchUserDetail(id);
  }, [id]);

  // Return of App.js divided to 2 styled components: ListView and Detail
  return (
    <>
      <BrowserRouter>
        <Main>
          <ListView>
            {users.length > 0 && (
              <Virtuoso
                data={users}
                data-virtuoso-scroller="true"
                style={{ height: "100vh" }}
                totalCount={200}
                endReached={loadMore}
                overscan={200}
                itemContent={(
                  index: number,
                  user: {
                    name: string;
                    id: string;
                    picture: string;
                    firstName: string;
                    lastName: string;
                  }
                ) => (
                  <VirtuosoCard>
                    <Link to={`/${user.id}`}>
                      <Card key={index} onClick={() => returnId(user)}>
                        <Image src={user.picture} />
                        <span
                          style={{ textAlign: "start", whiteSpace: "nowrap" }}
                        >
                          {user.firstName} {user.lastName}
                        </span>
                      </Card>
                    </Link>
                  </VirtuosoCard>
                )}
              />
            )}
          </ListView>

          {loading && <span>..loading</span>}

          <Routes>
            <Route
              path={`${userDetail.id}`}
              element={
                userDetail.id !== "" && (
                  <Detail key={userDetail.id}>
                    <h1>
                      {userDetail.firstName} {userDetail.lastName}
                    </h1>
                    <DetailImage
                      src={userDetail.picture}
                      alt={userDetail.picture}
                    ></DetailImage>
                    <p>Email: {userDetail.email}</p>
                    <p>Pohlavie: {userDetail.gender}</p>
                    <p>
                      Dátum narodenia: {userDetail.dateOfBirth.substring(0, 10)}
                    </p>
                    <p>Telefon: {userDetail.phone}</p>
                  </Detail>
                )
              }
            ></Route>
          </Routes>
        </Main>
      </BrowserRouter>
    </>
  );
};

export default App;

const Main = styled.main`
   {
    display: flex;
    flex-direction: row;
    height: 100%;
    width: 100%;
  }
`;

// ListView

const ListView = styled.div`
   {
    width: 300px;
    height: 100%;
    position: relative;
  }
`;

const VirtuosoCard = styled.div`
   {
    displa: flex;
    border-radius: 8px;
    border: 1px solid gray;
    width: auto;
    height: 95px;
    margin: 8px;
    align-items: center;
  }
`;

const Card = styled.div`
   {
    display: flex;
    padding: 16px;
    gap: 16px;
    justify-content: start;
    align-items: center;
  }
`;

const Image = styled.img`
   {
    heigh: 64px;
    width: 64px;
    border-radius: 8px;
    aspect-ratio: auto 64 / 64;
  }
`;

// Detail

const Detail = styled.div`
   {
    display: flex;
    flex-direction: column;
    positon: absolute;
    left: 300px;
  }
`;

const DetailImage = styled.img`
   {
    width: 64px;
    height: 64px;
  }
`;
