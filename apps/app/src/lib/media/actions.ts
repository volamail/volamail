import { nanoid } from "nanoid";
import sizeOf from "image-size";
import { and, eq } from "drizzle-orm";
import { action } from "@solidjs/router";
import { object, instance, string, optional } from "valibot";

import { db } from "../db";
import { env } from "../env";
import { imagesTable } from "../db/schema";
import { requireUser } from "../auth/utils";
import { parseFormData } from "../server-utils";
import { getMediaUrl, s3 } from "./server-utils";
import { requireUserToBeMemberOfProject } from "../projects/utils";

export const addImage = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      projectId: string(),
      file: instance(File),
      name: optional(string()),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: body.projectId,
  });

  // TODO: Check if file is an image

  // TODO: Check if file is too big

  // TODO: Check if user has enough storage left

  const id = nanoid(32);

  const buffer = (await body.file.arrayBuffer()) as Buffer;

  const dimensions = sizeOf(new Uint8Array(buffer));

  await Promise.all([
    s3.putObject({
      Bucket: env.AWS_BUCKET,
      Key: `media/${id}`,
      Body: buffer,
      ContentType: body.file.type,
    }),
    db.insert(imagesTable).values({
      id,
      projectId: body.projectId,
      name: body.name || body.file.name,
      size: Math.floor(body.file.size / 8),
      dimensions: `${dimensions.width}x${dimensions.height}`,
    }),
  ]);

  return {
    success: true,
    data: {
      id,
      url: getMediaUrl(id),
    },
  };
}, "media");

export const editMedia = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      projectId: string(),
      id: string(),
      name: string(),
      file: optional(instance(File)),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: body.projectId,
  });

  // TODO: Check if user has enough storage left

  if (body.file && body.file.size > 0) {
    const buffer = (await body.file.arrayBuffer()) as Buffer;

    const dimensions = sizeOf(new Uint8Array(buffer));

    await Promise.all([
      s3.putObject({
        Bucket: env.AWS_BUCKET,
        Key: `media/${body.id}`,
        Body: buffer,
        ContentType: body.file.type,
      }),
      db
        .update(imagesTable)
        .set({
          name: body.name,
          dimensions: `${dimensions.width}x${dimensions.height}`,
        })
        .where(
          and(
            eq(imagesTable.id, body.id),
            eq(imagesTable.projectId, body.projectId)
          )
        ),
    ]);

    return {
      success: true,
    };
  }

  await db
    .update(imagesTable)
    .set({
      name: body.name,
    })
    .where(
      and(
        eq(imagesTable.id, body.id),
        eq(imagesTable.projectId, body.projectId)
      )
    );

  return {
    success: true,
  };
}, "media");

export const deleteImage = action(async (formData: FormData) => {
  "use server";

  const user = requireUser();

  const body = await parseFormData(
    object({
      projectId: string(),
      id: string(),
    }),
    formData
  );

  await requireUserToBeMemberOfProject({
    userId: user.id,
    projectId: body.projectId,
  });

  await Promise.all([
    s3.deleteObject({
      Bucket: env.AWS_BUCKET,
      Key: `media/${body.id}`,
    }),
    db
      .delete(imagesTable)
      .where(
        and(
          eq(imagesTable.id, body.id),
          eq(imagesTable.projectId, body.projectId)
        )
      ),
  ]);

  return {
    success: true,
  };
}, "media");
