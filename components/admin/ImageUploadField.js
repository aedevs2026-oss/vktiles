"use client";



import Image from "next/image";

import { useState } from "react";

import { ui } from "@/components/admin/admin-ui";



export default function ImageUploadField({

  name = "imageFile",

  urlFieldName = "image",

  existingFieldName = "existingImage",

  label = "Image",

  defaultUrl = "",

  hint = "Upload JPEG, PNG, or WebP (max 10 MB). Or paste an image URL below.",

}) {

  const [preview, setPreview] = useState(defaultUrl || "");

  const [urlValue, setUrlValue] = useState(defaultUrl || "");



  function onFileChange(e) {

    const file = e.target.files?.[0];

    if (!file) return;

    setPreview(URL.createObjectURL(file));

    setUrlValue("");

  }



  return (

    <div className="space-y-3">

      <label className={ui.label}>{label}</label>



      {preview && (

        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">

          <Image src={preview} alt="Preview" fill className="object-cover" unoptimized />

        </div>

      )}



      <input type="hidden" name={existingFieldName} value={defaultUrl || ""} />



      <input

        type="file"

        name={name}

        accept="image/jpeg,image/png,image/webp,image/gif"

        onChange={onFileChange}

        className="block w-full text-sm text-gray file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-sky file:text-white file:text-sm file:font-medium"

      />



      <input

        type="url"

        name={urlFieldName}

        value={urlValue}

        onChange={(e) => {

          setUrlValue(e.target.value);

          setPreview(e.target.value);

        }}

        placeholder="Or paste image URL..."

        className={ui.input}

      />



      <p className={ui.hint}>{hint}</p>

    </div>

  );

}


