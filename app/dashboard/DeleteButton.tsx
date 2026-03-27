"use client"

export default function DeleteButton({ id }: { id: string }) {
  const handleDelete = async () => {
    await fetch("/api/assets/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    })

    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="absolute top-2 right-2 text-gray-300 hover:text-red-500 text-lg"
    >
      ✕
    </button>
  )
}