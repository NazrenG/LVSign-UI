/** Mock directory. Replace with an API call (e.g. GET /people) later. */
export const PEOPLE = {
  nk: {
    id: "nk",
    name: "Nazrin Guliyeva",
    department: "System Developer",
    title: "System Developer",
  },
  fa: {
    id: "fa",
    name: "Farid Aliyev",
    department: "Operations",
    title: "Operations manager",
  },
  lh: {
    id: "lh",
    name: "Leyla Hasanova",
    department: "Finance",
    title: "Finance",
  },
  og: {
    id: "og",
    name: "Orkhan Guliyev",
    department: "Management",
    title: "Director",
  },
  am: {
    id: "am",
    name: "Aysel Mammadova",
    department: "Operations — Koroglu Depot",
    title: "Employee",
    managerId: "fa",
  },
  rm: {
    id: "rm",
    name: "Rashad Mammadli",
    department: "Operations",
    title: "Shift lead",
  },
  ti: {
    id: "ti",
    name: "Tural Ismayilov",
    department: "Logistics",
    title: "Fleet",
  },
};

export const CURRENT_USER = PEOPLE.nk;
