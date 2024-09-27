export default function decorate(block) {
    const buttonContainers = block.querySelectorAll('.button-container a');
    const contentSections = Array.from(block.querySelectorAll('.button-container + div'));

    // Hide all content sections initially except for the first one
    contentSections.forEach((section, index) => {
        section.style.display = index === 0 ? 'block' : 'none';
    });

    // Find the existing header
    const header = block.querySelector('h3');

    // Move the header to the top of the block
    block.insertBefore(header, block.firstChild);

    // Create a dropdown for navigation
    const dropdown = document.createElement('select');
    dropdown.id = 'button-dropdown';

    block.insertBefore(dropdown, header.nextSibling);

    // Populate the dropdown with options corresponding to the buttons
    buttonContainers.forEach((button, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = button.textContent;
        dropdown.appendChild(option);
    });

    // Add an event listener to the dropdown
    dropdown.addEventListener('change', function() {
        contentSections.forEach(section => section.style.display = 'none');
        const selectedIndex = parseInt(this.value, 10);
        if (contentSections[selectedIndex]) {
            contentSections[selectedIndex].style.display = 'block';
        }
    });

    // Content switching logic for buttons
    buttonContainers.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            contentSections.forEach(section => section.style.display = 'none');
            contentSections[index].style.display = 'block';
        });
    });

    // Extract and move the testimonials
    const testimonialList = block.querySelector('ul');
    const testimonials = testimonialList.querySelectorAll('li');
    testimonials.forEach((testimonial, index) => {
        testimonial.style.display = index === 0 ? 'block' : 'none';
    });
}