export type User = {
    username: string | null,
    url: string | null,
    verified: boolean,
    name: string | null,
    profilepicture: string | null,
    following: string | null,
    followers: string | null,
    likes: string | null,
    description: string | null
}

export type Error = {
    error: any
}

export type Video = {
    username: string | null,
    url: string | null,
    id: string | null,
    thumbnail: string | null,
    likes: string | null,
    description: string | null,
    comments: string | null,
    shares: string | null,
    date: string | null
}

export type Tag = {
    username: string | null,
    url: string | null,
    id: string | null,
    thumbnail: string | null,
    views: string | null,
    date: string | null
}