import Link from "next/link";
import Image from "next/image";

const Logo = () => {
    return (
        <Link href="/task-manager/your-workspace">
            <div className="flex items-center">
                <Image
                    src="/icon.svg"
                    alt="Task Manager App Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                />
            </div>
        </Link>
    )
}

export default Logo 