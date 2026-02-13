import { inngest } from "./client";
import {prisma} from "@/app/db";

export const syncUserCreation = inngest.createFunction(
    { id: "sync-user-create" },
    { event: "clerk/user.created" },
    async ({ event, step }) => {
        const { data } = event;
        prisma.users.create({
            data: {
                id: data.id,
                email: data.email_addresses[0].email_address,
                name: data.first_name + " " + data.last_name,
                image: data.image_url,
            }
        })
    },
);

export const syncUserUpdate = inngest.createFunction(
    { id: "sync-user-update" },
    {event: "clerk/user.updated" },
    async ({event}) => {
        const {data} = event
        await prisma.users.update({
            where: {
                id: data.id
            },
            data: {
                email: data.email_addresses[0].email_address,
                name: data.first_name + " " + data.last_name,
                image: data.image_url,
            }
        })
    }
)

export const syncUserDeletion = inngest.createFunction(
    { id: "sync-user-delete" },
    {event: "clerk/user.deleted" },
    async ({event}) => {
        const {data} = event
        await prisma.users.delete({
            where: {
                id: data.id
            }
        })
    }
)