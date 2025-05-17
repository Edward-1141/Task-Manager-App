import Link from "next/link";

const Logo = () => {
    return (
        <Link href="/task-manager/your-workspace">
            <div className="flex items-center">
                <span className="self-center text-2xl font-semibold whitespace-nowrap">TMA</span>
            </div>
        </Link>
    )
}

export default Logo 