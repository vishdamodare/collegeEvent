import { Participant } from "@/types/admin";

export let MOCK_PARTICIPANTS: Participant[] = [
  {
    id: "part-1",
    name: "Rohan Sawant",
    registrationId: "REG-2026-0091",
    ticketNumber: "TKT-8841-A",
    college: "D.Y. Patil College of Engineering",
    department: "Computer Engineering",
    email: "rohansawant@gmail.com",
    phone: "+91 99221 13344",
    paymentStatus: "PAID",
    attendance: false,
    certificateStatus: "PENDING",
    registrationDate: "2026-07-05T14:35:00Z",
    teamName: "CodeBusters",
    teamMembers: ["Rohan Sawant", "Siddhesh Kulkarni", "Mayur Patil"],
  },
  {
    id: "part-2",
    name: "Sneha Nair",
    registrationId: "REG-2026-0042",
    ticketNumber: "TKT-1928-B",
    college: "K.J. Somaiya College of Engineering",
    department: "Information Technology",
    email: "sneha.nair@somaiya.edu",
    phone: "+91 98112 23344",
    paymentStatus: "PAID",
    attendance: true,
    certificateStatus: "GENERATED",
    registrationDate: "2026-07-06T09:20:00Z",
    teamName: "ByteForce",
    teamMembers: ["Sneha Nair", "Aishwarya Iyer"],
  },
  {
    id: "part-3",
    name: "Nikhil Joshi",
    registrationId: "REG-2026-0185",
    ticketNumber: "TKT-4721-C",
    college: "Veermata Jijabai Technological Institute (VJTI)",
    department: "Electronics & Telecommunication",
    email: "nikhiljoshi@vjti.org.in",
    phone: "+91 88334 45566",
    paymentStatus: "PAID",
    attendance: false,
    certificateStatus: "NONE",
    registrationDate: "2026-07-08T11:15:00Z",
    teamName: "MechBots",
    teamMembers: ["Nikhil Joshi", "Jay Shah", "Vikram Rathore"],
  },
  {
    id: "part-4",
    name: "Tanvi Deshmukh",
    registrationId: "REG-2026-0010",
    ticketNumber: "TKT-9012-D",
    college: "Thadomal Shahani Engineering College",
    department: "Artificial Intelligence",
    email: "tanvi.d@tsec.edu",
    phone: "+91 97771 12233",
    paymentStatus: "PENDING",
    attendance: false,
    certificateStatus: "NONE",
    registrationDate: "2026-07-10T16:40:00Z",
    teamMembers: ["Tanvi Deshmukh"],
  },
  {
    id: "part-5",
    name: "Vikram Malhotra",
    registrationId: "REG-2026-0030",
    ticketNumber: "TKT-5521-E",
    college: "Vidyalankar Institute of Technology",
    department: "Computer Engineering",
    email: "vikram.m@student.vit.edu",
    phone: "+91 98888 11223",
    paymentStatus: "FREE",
    attendance: true,
    certificateStatus: "SENT",
    registrationDate: "2026-07-11T12:00:00Z",
    teamMembers: ["Vikram Malhotra"],
  },
];

export function updateParticipant(id: string, updatedFields: Partial<Participant>): boolean {
  const index = MOCK_PARTICIPANTS.findIndex(p => p.id === id);
  if (index !== -1) {
    MOCK_PARTICIPANTS[index] = {
      ...MOCK_PARTICIPANTS[index],
      ...updatedFields,
    };
    return true;
  }
  return false;
}
