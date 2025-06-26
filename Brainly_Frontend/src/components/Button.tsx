//@ts-ignore
import { ReactElement } from "react";

export interface ButtonProps{
    variant : "primary" | "secondary";
    size: "sm" | "md" | "lg";
    text : string;
    startIcon?: ReactElement;
    endIcon? : ReactElement;
    onClick?: () => void;
    fullWidth?: boolean;      // Add this
    loading?: boolean;  
}

const variantClasses = {
    "primary": "bg-purple-600 text-white", // Styles for primary variant
    "secondary": "bg-purple-200 text-purple-600", // Styles for secondary variant
};

const defaultStyles = "px-4 py-2 rounded-md font-light flex items-center";

export const Button = (props : ButtonProps) =>{

    return   (<button onClick={props.onClick} className={variantClasses[props.variant] + " " + defaultStyles + `${props.fullWidth ? " w-full flex justify-center items-center" : ""} ${props.loading ? "opacity-45" : ""}` } disabled={props.loading} >
            {/* Container for optional start icon */}
            <div className="pr-2">
                {props.startIcon}
            </div>
            {/* Button text */}
            {props.text}
        </button>
    )
}

<Button variant="primary" size="md" onClick={()=> {}} text=""></Button>