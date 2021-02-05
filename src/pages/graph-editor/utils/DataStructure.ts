export class Queue<type = any> {
  private values: type[] = [];
  private head: number = 0;
  private tail: number = 0;

  push(value: type) {
    this.tail = this.values.push(value);
  }

  empty(): boolean {
    return this.head === this.tail;
  }

  clear(): void {
    (this.head = this.tail = 0), (this.values = []);
  }

  front(): type {
    if (this.empty()) throw new Error("ds Queue : cannot query front() of an empty Queue!");
    return this.values[this.head];
  }

  pop() {
    if (this.empty()) throw new Error("ds Queue : cannot pop() from an empty Queue!");
    ++this.head;
  }

  size(): number {
    return this.tail - this.head;
  }
}

export class Stack<type = any> {
  private values: type[] = [];
  private count: number = 0;

  push(value: type) {
    this.count = this.values.push(value);
  }

  empty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    (this.count = 0), (this.values = []);
  }

  top(): type {
    if (this.empty()) throw new Error("ds Stack : cannot query top() of an empty Stack!");
    return this.values[this.count - 1];
  }

  pop() {
    if (this.empty()) throw new Error("ds Stack : cannot pop() from an empty Stack!");
    this.count--, this.values.pop();
  }

  size(): number {
    return this.count;
  }
}
