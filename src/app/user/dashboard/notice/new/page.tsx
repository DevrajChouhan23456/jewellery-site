"use client";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Textarea } from "../../../../../components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import React, { useActionState } from "react";
import * as action from "../../../../actions";

function CreateNoticePage() {
  const [formStatedata, createaction] = useActionState(action.createNotice, {
    message: "",
  });

  return (
    <div>
      <div className="flex justify-between my-10">
        <h1 className="text-4xl font-bold mx-5">Create Notice</h1>
      </div>

      {/* ✅ multipart/form-data required for file upload */}
      <form action={createaction} encType="multipart/form-data">
        <div className="flex flex-col w-2/3 mx-auto">
          {/* Title */}
          <Label className="mb-1 font-bold mx-5 text-lg">Title</Label>
          <Input
            placeholder="Title"
            className="h-10 my-4"
            name="title"
            required
          />

          {/* Description */}
          <Label className="mb-1 font-bold mx-5 text-lg">Description</Label>
          <Textarea
            placeholder="Description"
            className="h-40 my-4"
            name="notice"
            required
          />

          {/* ✅ Optional Image */}
          <Label className="mb-1 font-bold mx-5 text-lg">Image (Optional)</Label>
          <Input
            type="file"
            name="image"
            accept="image/*"
            className="my-4"
          />

          {/* Error / Status message */}
          {formStatedata.message && (
            <div className="text-red-500 p-2 font-medium">
              {formStatedata.message}
            </div>
          )}

          <Button type="submit" className="px-6 py-5 rounded-xl shadow-md w-32">
            New
          </Button>
        </div>
      </form>
    </div>
  );
}

export default CreateNoticePage;