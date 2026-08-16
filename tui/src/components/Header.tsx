import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

export default function Header() {
    return (
        <Gradient name="pastel">
            <BigText font="block" text="partytype" />
        </Gradient>
    );
}